import React, { useState } from 'react';
import { View } from 'react-native';
import { Backdrop } from '../components/Backdrop';
import { TabBar, type TabKey } from '../components/TabBar';
import { HomeTab } from '../screens/HomeTab';
import { ProfileTab } from '../screens/ProfileTab';
import { RanksTab } from '../screens/RanksTab';
import { colors } from '../theme';

/** Haupt-Screen mit den drei Tabs Fächer, Ränge und Profil. */
export default function Home() {
  const [tab, setTab] = useState<TabKey>('home');
  return (
    <View style={{ flex: 1, backgroundColor: colors.screen }}>
      <Backdrop />
      <View style={{ flex: 1 }}>{tab === 'home' ? <HomeTab /> : tab === 'ranks' ? <RanksTab /> : <ProfileTab />}</View>
      <TabBar active={tab} onChange={setTab} />
    </View>
  );
}
