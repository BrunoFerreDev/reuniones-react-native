import React from 'react';
import { Tabs, TabSlot } from 'expo-router/ui';
import { View } from 'react-native';

export default function AppTabs() {
  return (
    <Tabs>
      <View style={{ flex: 1, minHeight: '100%', backgroundColor: '#f8fafc' }}>
        <TabSlot style={{ flex: 1 }} />
      </View>
    </Tabs>
  );
}
