import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  ScrollView, StatusBar, SafeAreaView, Image, Animated,
  Dimensions, FlatList,
} from 'react-native';
import { useApp } from '../context/AppContext';

const { width: SW } = Dimensions.get('window');
const DATE_COL = 82;
const SLOT_W   = 120;
const SLOT_H   = 58;
const ROW_H    = SLOT_H + 2;

const fmtDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  const day = String(d.getDate()).padStart(2,'0');
  const mon = d.toLocaleDateString('en-US',{month:'short'}).toUpperCase();
  const yr  = String(d.getFullYear()).slice(2);
  return `${day} ${mon} ${yr}`;
};

const DAY_COLORS = {
  Monday:    {bg:'#C0392B',text:'#FFFFFF'},
  Tuesday:   {bg:'#E67E22',text:'#FFFFFF'},
  Wednesday: {bg:'#D4AC0D',text:'#000000'},
  Thursday:  {bg:'#1E8449',text:'#FFFFFF'},
  Friday:    {bg:'#1A5276',text:'#FFFFFF'},
  Saturday:  {bg:'#6C3483',text:'#FFFFFF'},
  Sunday:    {bg:'#717D7E',text:'#FFFFFF'},
};

export default function HomeScreen({ navigation }) {
  const {
    theme: T, timetables, attendance, saveAttendance,
    getAllRows, makeAttKey, getStatuses, isTransparent,
  } = useApp();

  const [rows, setRows]       = useState([]);
  const [globalSlots, setGlobalSlots] = useState([]); // [{start,end,key}] — time columns
  const [modal, setModal]     = useState(null);
  const fadeAnim              = useRef(new Animated.Value(0)).current;
  const headerScrollRef       = useRef(null);
  const rowScrollRefs         = useRef({});
  const scrollX               = useRef(0);
  const logoTaps              = useRef(0);
  const logoTimer             = useRef(null);

  useEffect(() => {
    const r = getAllRows();
    setRows(r);
    // Build global time slot list from all timetables, sorted by start
    const seen = new Set();
    const gSlots = [];
    timetables.forEach(tt => {
      (tt.timeSlots || []).forEach(ts => {
        const k = `${ts.start}-${ts.end}`;
        if (!seen.has(k)) { seen.add(k); gSlots.push({start:ts.start,end:ts.end,key:k}); }
      });
    });
    gSlots.sort((a,b)=>a.start.localeCompare(b.start));
    setGlobalSlots(gSlots);
  }, [timetables, attendance]);

  // Auto scroll to last filled row
  const flatRef = useRef(null);
  useEffect(() => {
    if (rows.length===0) return;
    const keys = Object.keys(attendance);
    if (keys.length===0) return;
    let lastRow = 0;
    keys.forEach(k => {
      const parts = k.split('_');
      const date = parts[1];
      const idx  = rows.findIndex(r=>r.date===date);
      if (idx > lastRow) lastRow = idx;
    });
    if (lastRow > 0) {
      setTimeout(()=>{
        flatRef.current?.scrollToIndex({index:lastRow,animated:false,viewPosition:0.3});
      },400);
    }
  }, [rows]);

  const handleLogoTap = () => {
    logoTaps.current++;
    if (logoTimer.current) clearTimeout(logoTimer.current);
    logoTimer.current = setTimeout(()=>{ logoTaps.current=0; },700);
    if (logoTaps.current>=3) { logoTaps.current=0; navigation.navigate('Settings'); }
  };

  // Sync horizontal scroll across all rows + header
  const syncH = useCallback((x) => {
    headerScrollRef.current?.scrollTo({x,animated:false});
    Object.values(rowScrollRefs.current).forEach(r=>r?.scrollTo({x,animated:false}));
  }, []);

  const handleHScroll = useCallback((e) => {
    const x = e.nativeEvent.contentOffset.x;
    if (Math.abs(x - scrollX.current) > 1) {
      scrollX.current = x;
      syncH(x);
    }
  }, [syncH]);

  const openModal = (row, slotKey, slotName, isTransp) => {
    if (isTransp) return; // transparent = not tappable
    setModal({row, slotKey, slotName});
    Animated.timing(fadeAnim,{toValue:1,duration:160,useNativeDriver:true}).start();
  };

  const closeModal = () =>
    Animated.timing(fadeAnim,{toValue:0,duration:120,useNativeDriver:true})
      .start(()=>setModal(null));

  const selectStatus = (status) => {
    if (!modal) return;
    const key = makeAttKey(modal.row.ttId, modal.row.date, modal.slotKey);
    saveAttendance({...attendance,[key]:status});
    closeModal();
  };

  const clearStatus = () => {
    if (!modal) return;
    const key = makeAttKey(modal.row.ttId, modal.row.date, modal.slotKey);
    const u = {...attendance}; delete u[key];
    saveAttendance(u); closeModal();
  };

  // Empty state
  if (timetables.length===0) return (
    <SafeAreaView style={[styles.container,{backgroundColor:T.emptyBg}]}>
      <StatusBar barStyle={T.isDark?'light-content':'dark-content'} backgroundColor={T.topBarBg}/>
      <View style={[styles.topBar,{backgroundColor:T.topBarBg,borderBottomColor:T.topBarBorder}]}>
        <TouchableOpacity onPress={handleLogoTap} activeOpacity={0.85} style={styles.logoBtn}>
          <Image source={T.isDark?require('../../assets/logo_dark.png'):require('../../assets/logo_light.png')}
            style={styles.logoImg} resizeMode="contain"/>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.statsBtn,{backgroundColor:T.statsBtnBg,borderColor:T.statsBtnBorder}]}
          onPress={()=>navigation.navigate('Summary')}>
          <Text style={[styles.statsTxt,{color:T.statsBtnText}]}>Stats →</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.emptyWrap}>
        <Text style={[styles.emptyTitle,{color:T.emptyText}]}>No timetable yet</Text>
        <Text style={[styles.emptyHint,{color:T.emptyText}]}>
          Tap the logo in the top-left{'\n'}3 times to open Settings{'\n'}and create your first timetable
        </Text>
      </View>
    </SafeAreaView>
  );

  // Header: frozen "Date" + scrollable time-slot labels
  const renderHeader = () => (
    <View style={[styles.headerRow,{backgroundColor:T.headerBg}]}>
      <View style={[styles.dateHeaderCell,{backgroundColor:T.headerBg,width:DATE_COL}]}>
        <Text style={styles.hdrTxt}>Date</Text>
      </View>
      <ScrollView ref={headerScrollRef} horizontal showsHorizontalScrollIndicator={false}
        scrollEnabled={false} style={{flex:1}}>
        <View style={{flexDirection:'row'}}>
          {globalSlots.map((gs,i)=>{
            // Calculate span for merged slots — but header just shows time
            return(
              <View key={i} style={[styles.slotHdr,{width:SLOT_W}]}>
                <Text style={styles.hdrTxt} adjustsFontSizeToFit numberOfLines={1}>{gs.start}</Text>
                <Text style={[styles.hdrSubTxt]}>→ {gs.end}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );

  const renderRow = ({item:row, index}) => {
    const dayC = DAY_COLORS[row.dayName]||{bg:'#555',text:'#fff'};
    const statuses = getStatuses();
    // Build cell for each global slot
    const cells = [];
    let gi = 0;
    while (gi < globalSlots.length) {
      const gs = globalSlots[gi];
      // Find matching slot in this row's day slots
      const rowSlot = row.slots.find(s=>s.start===gs.start&&s.end===gs.end);
      if (!rowSlot) {
        // Empty cell — this slot doesn't exist for this day
        cells.push(
          <View key={gi} style={[styles.cell,{width:SLOT_W-2,backgroundColor:T.bg3,opacity:0.25}]}/>
        );
        gi++; continue;
      }
      const isTransp  = isTransparent(row.date, row.dayName, rowSlot.name);
      const slotKey   = `${rowSlot.start}-${rowSlot.end}`;
      const attKey    = makeAttKey(row.ttId, row.date, slotKey);
      const status    = attendance[attKey];
      const statusObj = status ? statuses.find(s=>s.value===status) : null;
      // Merged slot: spans 2 columns if isLab
      const spanCols  = rowSlot.isLab ? 2 : 1;
      const cellW     = SLOT_W * spanCols - 2;

      cells.push(
        <TouchableOpacity key={gi}
          style={[styles.cell,{width:cellW},
            rowSlot.isLab&&{backgroundColor:T.labCellBg},
            statusObj&&{backgroundColor:statusObj.color},
            isTransp&&{backgroundColor:T.bg3,opacity:0.5},
          ]}
          onPress={()=>openModal(row,slotKey,rowSlot.name,isTransp)}
          activeOpacity={isTransp?1:0.7}>
          <Text style={[styles.cellTxt,{color:T.cellText},
            statusObj&&{color:statusObj.textColor},
            isTransp&&{color:T.text3}]}
            numberOfLines={2} adjustsFontSizeToFit>
            {rowSlot.name}
          </Text>
        </TouchableOpacity>
      );
      gi += spanCols; // skip next col if merged
    }

    return (
      <View style={[styles.row,{borderBottomColor:T.border,height:ROW_H}]}>
        <View style={[styles.dateCell,{backgroundColor:T.dayColBg,borderRightColor:T.border,width:DATE_COL}]}>
          <Text style={[styles.dateTxt,{color:T.text}]}>{fmtDate(row.date)}</Text>
          <View style={[styles.dayBadge,{backgroundColor:dayC.bg}]}>
            <Text style={[styles.dayTxt,{color:dayC.text}]}>{row.dayName.slice(0,3).toUpperCase()}</Text>
          </View>
        </View>
        <ScrollView
          ref={r=>{rowScrollRefs.current[index]=r;}}
          horizontal showsHorizontalScrollIndicator={false}
          onScroll={handleHScroll} scrollEventThrottle={8}
          decelerationRate="fast"
          style={{flex:1}}>
          <View style={{flexDirection:'row',height:ROW_H,alignItems:'center'}}>
            {cells}
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container,{backgroundColor:T.bg}]}>
      <StatusBar barStyle={T.isDark?'light-content':'dark-content'} backgroundColor={T.topBarBg}/>
      <View style={[styles.topBar,{backgroundColor:T.topBarBg,borderBottomColor:T.topBarBorder}]}>
        <TouchableOpacity onPress={handleLogoTap} activeOpacity={0.85} style={styles.logoBtn}>
          <Image source={T.isDark?require('../../assets/logo_dark.png'):require('../../assets/logo_light.png')}
            style={styles.logoImg} resizeMode="contain"/>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.statsBtn,{backgroundColor:T.statsBtnBg,borderColor:T.statsBtnBorder}]}
          onPress={()=>navigation.navigate('Summary')}>
          <Text style={[styles.statsTxt,{color:T.statsBtnText}]}>Stats →</Text>
        </TouchableOpacity>
      </View>

      {renderHeader()}

      <FlatList
        ref={flatRef}
        data={rows}
        keyExtractor={item=>`${item.ttId}_${item.date}`}
        renderItem={renderRow}
        getItemLayout={(_,i)=>({length:ROW_H,offset:ROW_H*i,index:i})}
        initialNumToRender={25} windowSize={12}
        showsVerticalScrollIndicator={false}
        onScrollToIndexFailed={()=>{}}
      />

      <Modal visible={!!modal} transparent animationType="none" onRequestClose={closeModal}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeModal}>
          <Animated.View style={[styles.modalBox,{opacity:fadeAnim,
            backgroundColor:T.modalBg,borderColor:T.modalBorder}]}>
            <TouchableOpacity activeOpacity={1}>
              <Text style={[styles.mSlot,{color:T.text}]}>{modal?.slotName}</Text>
              <Text style={[styles.mDate,{color:T.text3}]}>
                {modal?fmtDate(modal.row.date):''} · {modal?.row?.dayName}
              </Text>
              {getStatuses().map(opt=>(
                <TouchableOpacity key={opt.value}
                  style={[styles.optBtn,{backgroundColor:opt.color}]}
                  onPress={()=>selectStatus(opt.value)}>
                  <Text style={[styles.optTxt,{color:opt.textColor}]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={[styles.clearBtn,{borderColor:T.border}]} onPress={clearStatus}>
                <Text style={[styles.clearTxt,{color:T.text3}]}>CLEAR</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      {flex:1},
  topBar:         {flexDirection:'row',alignItems:'center',justifyContent:'space-between',
                   paddingHorizontal:12,paddingVertical:8,borderBottomWidth:1},
  logoBtn:        {flex:1,height:44},
  logoImg:        {height:44,width:'65%'},
  statsBtn:       {paddingHorizontal:14,paddingVertical:7,borderRadius:20,borderWidth:1},
  statsTxt:       {fontSize:13,fontWeight:'600'},
  emptyWrap:      {flex:1,alignItems:'center',justifyContent:'center',paddingHorizontal:40},
  emptyTitle:     {fontSize:22,fontWeight:'700',marginBottom:16},
  emptyHint:      {fontSize:15,textAlign:'center',lineHeight:28},
  headerRow:      {flexDirection:'row',height:44},
  dateHeaderCell: {justifyContent:'center',alignItems:'center',
                   borderRightWidth:1,borderRightColor:'rgba(255,255,255,0.15)'},
  slotHdr:        {justifyContent:'center',alignItems:'center',paddingHorizontal:4,
                   borderRightWidth:1,borderRightColor:'rgba(255,255,255,0.1)'},
  hdrTxt:         {color:'#FFFFFF',fontSize:10,fontWeight:'700',textAlign:'center'},
  hdrSubTxt:      {color:'rgba(255,255,255,0.65)',fontSize:8,textAlign:'center'},
  row:            {flexDirection:'row',borderBottomWidth:1},
  dateCell:       {justifyContent:'center',alignItems:'center',paddingHorizontal:3,borderRightWidth:1},
  dateTxt:        {fontSize:10,fontWeight:'700',textAlign:'center',marginBottom:3},
  dayBadge:       {paddingHorizontal:6,paddingVertical:2,borderRadius:3},
  dayTxt:         {fontSize:8,fontWeight:'800'},
  cell:           {height:SLOT_H,marginHorizontal:1,borderRadius:4,
                   justifyContent:'center',alignItems:'center',paddingHorizontal:4},
  cellTxt:        {fontSize:10,fontWeight:'600',textAlign:'center'},
  overlay:        {flex:1,backgroundColor:'rgba(0,0,0,0.65)',justifyContent:'center',alignItems:'center'},
  modalBox:       {borderRadius:18,padding:20,width:300,borderWidth:1,elevation:20,
                   shadowColor:'#000',shadowOpacity:0.5,shadowOffset:{width:0,height:8},shadowRadius:16},
  mSlot:          {fontSize:20,fontWeight:'800',marginBottom:2,letterSpacing:0.5},
  mDate:          {fontSize:12,marginBottom:16},
  optBtn:         {paddingVertical:13,borderRadius:10,marginBottom:7,alignItems:'center',elevation:2},
  optTxt:         {fontSize:13,fontWeight:'800',letterSpacing:1.5},
  clearBtn:       {marginTop:4,paddingVertical:11,alignItems:'center',borderRadius:10,borderWidth:1},
  clearTxt:       {fontSize:12,fontWeight:'700',letterSpacing:1.5},
});
