import React, { useState } from 'react';
import { Image, View } from 'react-native';

// Original CommuteSafe illustrations (PNG, drawn at 2x for sharp phone screens)
const ART = {
  skyline: { src: require('../../assets/illustrations/skyline.png'), ratio: 1200 / 220 },
  hero: { src: require('../../assets/illustrations/hero.png'), ratio: 720 / 420 },
  quiet: { src: require('../../assets/illustrations/quiet.png'), ratio: 240 / 160 },
  noReports: { src: require('../../assets/illustrations/empty-reports.png'), ratio: 240 / 200 },
  noNotifications: { src: require('../../assets/illustrations/empty-notifications.png'), ratio: 240 / 200 },
  noContacts: { src: require('../../assets/illustrations/empty-contacts.png'), ratio: 240 / 200 },
};

/**
 * <Illustration name="noContacts" width={180} />
 * - width as a number: fixed size (height follows the picture's proportions)
 * - width="100%": fills the available width (measured on screen first)
 * Exact pixel sizes are used because proportional sizing behaves differently on web.
 */
export default function Illustration({ name, width = 180, style, opacity }) {
  const art = ART[name];
  const fixed = typeof width === 'number';
  const [measured, setMeasured] = useState(0);
  if (!art) return null;

  const w = fixed ? width : measured;
  const image = w > 0 ? (
    <Image
      source={art.src}
      resizeMode="contain"
      style={{ width: w, height: Math.round(w / art.ratio) }}
    />
  ) : null;

  return (
    <View
      accessible={false}
      pointerEvents="none"
      style={[fixed ? { width } : { width: '100%' }, opacity != null && { opacity }, style]}
      onLayout={fixed ? undefined : (e) => {
        const lw = Math.round(e.nativeEvent.layout.width);
        if (lw !== measured) setMeasured(lw);
      }}
    >
      {image}
    </View>
  );
}
