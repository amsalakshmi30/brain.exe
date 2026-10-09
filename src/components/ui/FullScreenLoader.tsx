import React from 'react'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

export default function FullScreenLoader() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#F7F5F2',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          style={{ width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, #D66A3D 0%, #c0552e 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(214,106,61,0.35)' }}>
          <Zap style={{ width: 30, height: 30, color: 'white' }} />
        </motion.div>
        <div style={{ color: '#718096', fontSize: 13, fontWeight: 700,
          letterSpacing: '0.15em', textTransform: 'uppercase',
          fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Loading…</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 1, 2].map(i => (
            <motion.div key={i}
              style={{ width: 7, height: 7, borderRadius: '50%', background: '#D66A3D' }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }} />
          ))}
        </div>
      </div>
    </div>
  )
}
