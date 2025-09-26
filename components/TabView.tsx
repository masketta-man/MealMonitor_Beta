import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Tab {
  key: string;
  title: string;
}

interface TabViewProps {
  tabs: Tab[];
  activeTab: string;
  onChangeTab: (tabKey: string) => void;
  children: ReactNode;
}

const TabView = ({ tabs, activeTab, onChangeTab, children }: TabViewProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key ? styles.activeTab : {}
            ]}
            onPress={() => onChangeTab(tab.key)}
            activeOpacity={0.8}
          >
            <Text 
              style={[
                styles.tabText,
                activeTab === tab.key ? styles.activeTabText : {}
              ]}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#dcfce7',
    borderRadius: 30,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 30,
  },
  activeTab: {
    backgroundColor: '#22c55e',
  },
  tabText: {
    fontWeight: '700',
    fontSize: 16,
    color: '#166534',
  },
  activeTabText: {
    color: 'white',
  },
  content: {
    width: '100%',
  },
});

export default TabView;