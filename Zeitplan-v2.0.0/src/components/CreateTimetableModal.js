import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  ScrollView, TextInput, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useApp } from '../context/AppContext';

const DAYS_ORDER = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const toDateStr  = (d) => d.toISOString().split('T')[0];
const toTimeStr  = (d) => `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
const toMinutes  = (t) => { const [h,m] = t.split(':').map(Number); return h*60+m; };
const isMerged   = (s,e) => (toMinutes(e) - toMinutes(s)) >= 120;

function StepDots({ current, total, T }) {
  return (
    <View style={styles.dots}>
      {Array.from({length:total}).map((_,i)=>(
        <View key={i} style={[styles.dot,{
          backgroundColor: i<=current ? '#2D5A3D' : T.border,
          opacity: i<current ? 0.45 : 1
        }]}/>
      ))}
    </View>
  );
}

export default function CreateTimetableModal({ visible, onClose, T }) {
  const { timetables, saveTimetables } = useApp();
  const [step,      setStep]      = useState(0);
  const [ttName,    setTtName]    = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate,   setEndDate]   = useState(new Date());
  const [picker,    setPicker]    = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selDays,   setSelDays]   = useState([]);
  const [slotNames, setSlotNames] = useState({});
  const [error,     setError]     = useState('');
  const slotScrollRef = useRef(null);

  const reset = () => {
    setStep(0); setTtName(''); setStartDate(new Date()); setEndDate(new Date());
    setPicker(null); setTimeSlots([]); setSelDays([]); setSlotNames({}); setError('');
  };

  const goStep1 = () => {
    if (!ttName.trim())          { setError('Enter a name.'); return; }
    if (ttName.length > 20)      { setError('Max 20 chars.'); return; }
    if (timetables.some(t=>t.name===ttName.trim())) { setError('Name already exists.'); return; }
    setError(''); setStep(1);
  };

  const goStep2 = () => {
    if (endDate <= startDate) { setError('End must be after start.'); return; }
    for (const tt of timetables) {
      const ts=new Date(tt.startDate+'T00:00:00'), te=new Date(tt.endDate+'T00:00:00');
      if (!(endDate<ts||startDate>te)) { setError(`Overlaps with "${tt.name}".`); return; }
    }
    setError(''); setStep(2);
  };

  const addSlot = () => setTimeSlots(p=>[...p,{start:'09:00',end:'10:00'}]);
  const removeSlot = (i) => setTimeSlots(p=>p.filter((_,j)=>j!==i));

  const onPickerChange = (evt, sel) => {
    if (!picker || evt.type==='dismissed') { setPicker(null); return; }
    const val = sel || new Date();
    if (picker==='start') setStartDate(val);
    else if (picker==='end') setEndDate(val);
    else if (picker.t==='s') setTimeSlots(p=>{const n=[...p];n[picker.i]={...n[picker.i],start:toTimeStr(val)};return n;});
    else if (picker.t==='e') setTimeSlots(p=>{const n=[...p];n[picker.i]={...n[picker.i],end:toTimeStr(val)};return n;});
    setPicker(null);
  };

  const goStep3 = () => {
    if (timeSlots.length===0) { setError('Add at least one slot.'); return; }
    for (let i=0;i<timeSlots.length;i++) {
      if (toMinutes(timeSlots[i].end)<=toMinutes(timeSlots[i].start)) {
        setError(`Slot ${i+1}: end must be after start.`); return;
      }
    }
    const sorted=[...timeSlots].sort((a,b)=>a.start.localeCompare(b.start));
    for (let i=1;i<sorted.length;i++) {
      if (sorted[i].start<sorted[i-1].end) { setError('Slots overlap.'); return; }
    }
    setTimeSlots(sorted);
    setError(''); setStep(3);
  };

  const toggleDay = (day) => setSelDays(p=>p.includes(day)?p.filter(d=>d!==day):[...p,day]);

  const goStep4 = () => {
    if (selDays.length===0) { setError('Select at least one day.'); return; }
    const init={};
    timeSlots.forEach(ts=>{
      const k=`${ts.start}-${ts.end}`;
      init[k]={};
      selDays.forEach(d=>{ init[k][d]=''; });
    });
    setSlotNames(p=>({...init,...p}));
    setError(''); setStep(4);
  };

  const updateName = (k,d,v) => setSlotNames(p=>({...p,[k]:{...(p[k]||{}),[d]:v}}));

  const save = () => {
    for (const ts of timeSlots) {
      const k=`${ts.start}-${ts.end}`;
      for (const day of selDays) {
        const nm=((slotNames[k]||{})[day]||'').trim();
        if (!nm) { setError(`Missing name: ${ts.start}-${ts.end} on ${day}`); return; }
        if (nm.length>20) { setError(`Too long: ${ts.start}-${ts.end} on ${day}`); return; }
      }
    }
    const weekSlots={};
    selDays.forEach(day=>{
      weekSlots[day]=timeSlots.map(ts=>({
        name: ((slotNames[`${ts.start}-${ts.end}`]||{})[day]||'').trim(),
        start:ts.start, end:ts.end,
        isLab: isMerged(ts.start,ts.end),
      }));
    });
    saveTimetables([...timetables,{
      id:   Date.now().toString(),
      name: ttName.trim(),
      days: selDays, timeSlots, weekSlots,
      startDate: toDateStr(startDate),
      endDate:   toDateStr(endDate),
    }]);
    reset(); onClose();
  };

  const fmtDate = (d) => d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});

  const steps  = ['Name','Date Range','Time Slots','Class Days','Slot Names'];
  const onNext = [goStep1,goStep2,goStep3,goStep4,save];
  const labels = ['Next','Next','Next','Next','Save Timetable'];

  const pickerValue = () => {
    if (picker==='start') return startDate;
    if (picker==='end')   return endDate;
    if (picker?.t==='s'||picker?.t==='e') {
      const ts=timeSlots[picker.i];
      const [h,m]=(picker.t==='s'?ts.start:ts.end).split(':').map(Number);
      const d=new Date(); d.setHours(h,m,0,0); return d;
    }
    return new Date();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={()=>{reset();onClose();}}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={()=>{reset();onClose();}}>
        <TouchableOpacity activeOpacity={1}
          style={[styles.box,{backgroundColor:T.modalBg,borderColor:T.modalBorder}]}>
          <StepDots current={step} total={5} T={T}/>
          <Text style={[styles.title,{color:T.text}]}>{steps[step]}</Text>

          {/* Step 0 */}
          {step===0&&(
            <View>
              <Text style={[styles.lbl,{color:T.text2}]}>Timetable name (max 20)</Text>
              <TextInput style={[styles.input,{color:T.text,borderColor:T.border,backgroundColor:T.bg2}]}
                placeholder="e.g. Semester 1 2026" placeholderTextColor={T.text3}
                value={ttName} maxLength={20} onChangeText={setTtName}/>
            </View>
          )}

          {/* Step 1 */}
          {step===1&&(
            <View style={{gap:14}}>
              <View>
                <Text style={[styles.lbl,{color:T.text2}]}>Start Date</Text>
                <TouchableOpacity style={[styles.dateBtn,{borderColor:T.border,backgroundColor:T.bg2}]}
                  onPress={()=>setPicker('start')}>
                  <Text style={[styles.dateTxt,{color:T.text}]}>{fmtDate(startDate)}</Text>
                  <Text>📅</Text>
                </TouchableOpacity>
              </View>
              <View>
                <Text style={[styles.lbl,{color:T.text2}]}>End Date</Text>
                <TouchableOpacity style={[styles.dateBtn,{borderColor:T.border,backgroundColor:T.bg2}]}
                  onPress={()=>setPicker('end')}>
                  <Text style={[styles.dateTxt,{color:T.text}]}>{fmtDate(endDate)}</Text>
                  <Text>📅</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Step 2 */}
          {step===2&&(
            <View>
              <View style={{flexDirection:'row',justifyContent:'flex-end',gap:8,marginBottom:8}}>
                <TouchableOpacity
                  style={[styles.scrollJumpBtn,{borderColor:T.border}]}
                  onPress={()=>slotScrollRef.current?.scrollTo({y:0,animated:true})}>
                  <Text style={{color:T.text,fontSize:16}}>↑</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.scrollJumpBtn,{borderColor:T.border}]}
                  onPress={()=>slotScrollRef.current?.scrollToEnd({animated:true})}>
                  <Text style={{color:T.text,fontSize:16}}>↓</Text>
                </TouchableOpacity>
              </View>
              <ScrollView ref={slotScrollRef} style={{maxHeight:320}}>
                <Text style={[styles.hint,{color:T.text3}]}>
                  Slots ≥2 hours are shown as merged cells in the timetable.
                </Text>
                {timeSlots.map((ts,i)=>{
                  const merged=isMerged(ts.start,ts.end);
                  return(
                    <View key={i} style={[styles.tsRow,{borderColor:T.border,backgroundColor:T.bg2}]}>
                      <View style={{flex:1}}>
                        <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
                          <TouchableOpacity style={[styles.timeBtn,{borderColor:T.border}]}
                            onPress={()=>setPicker({t:'s',i})}>
                            <Text style={[styles.timeTxt,{color:T.text}]}>{ts.start}</Text>
                          </TouchableOpacity>
                          <Text style={{color:T.text3,fontWeight:'700'}}>→</Text>
                          <TouchableOpacity style={[styles.timeBtn,{borderColor:T.border}]}
                            onPress={()=>setPicker({t:'e',i})}>
                            <Text style={[styles.timeTxt,{color:T.text}]}>{ts.end}</Text>
                          </TouchableOpacity>
                          {merged&&<View style={styles.badge}><Text style={styles.badgeTxt}>MERGED</Text></View>}
                        </View>
                        <Text style={[styles.dur,{color:T.text3}]}>
                          {toMinutes(ts.end)-toMinutes(ts.start)} min
                          {merged?' · Merged cell':''}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={()=>removeSlot(i)} style={{paddingHorizontal:8}}>
                        <Text style={{color:'#E74C3C',fontSize:22}}>×</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
                <TouchableOpacity style={[styles.addBtn,{borderColor:'#2D5A3D'}]} onPress={addSlot}>
                  <Text style={{color:'#2D5A3D',fontWeight:'700'}}>+ Add Time Slot</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}

          {/* Step 3 */}
          {step===3&&(
            <ScrollView style={{maxHeight:360}}>
              <Text style={[styles.lbl,{color:T.text2}]}>Which days have classes?</Text>
              {DAYS_ORDER.map(day=>(
                <TouchableOpacity key={day}
                  style={[styles.dayRow,{borderColor:T.border},
                    selDays.includes(day)&&{borderColor:'#2D5A3D',
                      backgroundColor:T.isDark?'#0D2B0D':'#EAF4ED'}]}
                  onPress={()=>toggleDay(day)}>
                  <Text style={[styles.dayTxt,{color:T.text},
                    selDays.includes(day)&&{color:'#2D5A3D',fontWeight:'700'}]}>{day}</Text>
                  {selDays.includes(day)&&<Text style={{color:'#2D5A3D',fontSize:16}}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Step 4 */}
          {step===4&&(
            <ScrollView style={{maxHeight:400}}>
              <Text style={[styles.hint,{color:T.text3,marginBottom:14}]}>
                Name each time slot for each day. Same name across days = tracked together in stats.
              </Text>
              {timeSlots.map(ts=>{
                const k=`${ts.start}-${ts.end}`;
                return(
                  <View key={k} style={[styles.snBlock,{borderColor:T.border}]}>
                    <View style={{flexDirection:'row',alignItems:'center',gap:8,marginBottom:10}}>
                      <Text style={[styles.slotLbl,{color:T.text}]}>{ts.start} → {ts.end}</Text>
                      {isMerged(ts.start,ts.end)&&
                        <View style={styles.badge}><Text style={styles.badgeTxt}>MERGED</Text></View>}
                    </View>
                    {selDays.map(day=>(
                      <View key={day} style={{flexDirection:'row',alignItems:'center',marginBottom:8,gap:10}}>
                        <Text style={[styles.dayLbl,{color:T.text2}]}>{day.slice(0,3)}</Text>
                        <TextInput
                          style={[styles.nameIn,{color:T.text,borderColor:T.border,backgroundColor:T.bg2,flex:1}]}
                          placeholder="Slot name (max 20)" placeholderTextColor={T.text3}
                          value={(slotNames[k]||{})[day]||''}
                          maxLength={20}
                          onChangeText={v=>updateName(k,day,v)}/>
                      </View>
                    ))}
                  </View>
                );
              })}
            </ScrollView>
          )}

          {!!error&&<Text style={styles.err}>{error}</Text>}

          <View style={styles.btnRow}>
            {step>0&&(
              <TouchableOpacity style={[styles.backBtn,{borderColor:T.border}]}
                onPress={()=>{setError('');setStep(s=>s-1);}}>
                <Text style={[styles.backTxt,{color:T.text2}]}>← Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.nextBtn} onPress={onNext[step]}>
              <Text style={styles.nextTxt}>{labels[step]}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>

      {picker!==null&&(
        <DateTimePicker
          value={pickerValue()}
          mode={picker==='start'||picker==='end'?'date':'time'}
          is24Hour={true}
          display={Platform.OS==='ios'?'spinner':'default'}
          onChange={onPickerChange}
        />
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {flex:1,backgroundColor:'rgba(0,0,0,0.72)',justifyContent:'center',alignItems:'center',padding:16},
  box:     {width:'100%',maxWidth:400,borderRadius:20,padding:22,borderWidth:1,elevation:20},
  dots:    {flexDirection:'row',justifyContent:'center',gap:7,marginBottom:16},
  dot:     {width:8,height:8,borderRadius:4},
  title:   {fontSize:19,fontWeight:'800',marginBottom:18},
  lbl:     {fontSize:13,fontWeight:'600',marginBottom:8},
  hint:    {fontSize:12,lineHeight:18},
  input:   {height:48,borderWidth:1,borderRadius:10,paddingHorizontal:14,fontSize:15},
  dateBtn: {flexDirection:'row',alignItems:'center',justifyContent:'space-between',
            height:48,borderWidth:1,borderRadius:10,paddingHorizontal:14},
  dateTxt: {fontSize:15,fontWeight:'500'},
  tsRow:   {flexDirection:'row',alignItems:'center',borderRadius:10,borderWidth:1,padding:12,marginBottom:10},
  timeBtn: {paddingHorizontal:14,paddingVertical:9,borderRadius:8,borderWidth:1.5},
  timeTxt: {fontSize:15,fontWeight:'700'},
  dur:     {fontSize:11,marginTop:6},
  badge:   {backgroundColor:'#2D5A3D',paddingHorizontal:7,paddingVertical:3,borderRadius:4},
  badgeTxt:{color:'#FFFFFF',fontSize:9,fontWeight:'800'},
  scrollJumpBtn: {borderWidth:1,borderRadius:8,paddingHorizontal:12,paddingVertical:6},
  addBtn:  {borderWidth:1.5,borderRadius:10,borderStyle:'dashed',padding:14,alignItems:'center',marginTop:4},
  dayRow:  {flexDirection:'row',alignItems:'center',justifyContent:'space-between',
            padding:14,borderRadius:10,borderWidth:1,marginBottom:8},
  dayTxt:  {fontSize:15},
  snBlock: {borderWidth:1,borderRadius:10,padding:14,marginBottom:12},
  slotLbl: {fontSize:14,fontWeight:'700'},
  dayLbl:  {fontSize:13,fontWeight:'600',width:32},
  nameIn:  {height:40,borderWidth:1,borderRadius:8,paddingHorizontal:10,fontSize:13},
  err:     {color:'#E74C3C',fontSize:12,marginTop:10,textAlign:'center'},
  btnRow:  {flexDirection:'row',gap:10,marginTop:18},
  backBtn: {flex:1,paddingVertical:13,borderRadius:10,borderWidth:1,alignItems:'center'},
  backTxt: {fontSize:14,fontWeight:'600'},
  nextBtn: {flex:2,paddingVertical:13,borderRadius:10,backgroundColor:'#2D5A3D',alignItems:'center'},
  nextTxt: {color:'#FFFFFF',fontSize:14,fontWeight:'800'},
});