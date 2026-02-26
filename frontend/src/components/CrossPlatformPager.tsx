import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native';

const { width } = Dimensions.get('window');

interface CrossPlatformPagerProps {
  children: React.ReactNode[];
  initialPage?: number;
  onPageSelected?: (event: { nativeEvent: { position: number } }) => void;
  style?: any;
}

export const CrossPlatformPager: React.FC<CrossPlatformPagerProps> = ({
  children,
  initialPage = 0,
  onPageSelected,
  style,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const contentWidth = width;
  
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / contentWidth);
    
    if (page !== currentPage && page >= 0 && page < children.length) {
      setCurrentPage(page);
      onPageSelected?.({ nativeEvent: { position: page } });
    }
  }, [currentPage, contentWidth, children.length, onPageSelected]);
  
  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={16}
      onMomentumScrollEnd={handleScroll}
      contentOffset={{ x: initialPage * contentWidth, y: 0 }}
      style={[styles.container, style]}
      decelerationRate="fast"
      snapToInterval={contentWidth}
      snapToAlignment="start"
    >
      {React.Children.map(children, (child, index) => (
        <View key={index} style={[styles.page, { width: contentWidth }]}>
          {child}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
});

export default CrossPlatformPager;
