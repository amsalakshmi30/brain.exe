// ✅ 8. Custom 404 page — fully designed, on-brand
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Home, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div style={{
      minHeight: '100vh', background: '#1a1410', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '24px',
      fontFamily: 'Sora, sans-serif', overflowX: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(181,112,46,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', maxWidth: 420, position: 'relative' }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 40 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg,#c9621e,#9a5820)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(181,112,46,0.4)' }}>
            <Zap style={{ width: 18, height: 18, color: 'white' }} />
          </div>
          <span style={{ fontWeight: 900, color: 'white', fontSize: 16 }}>CAMPUS-SYNC</span>
        </Link>

        {/* 404 big number */}
        <motion.div
          initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          style={{ fontSize: 'clamp(80px,20vw,120px)', fontWeight: 900, lineHeight: 1, marginBottom: 16, display: 'block',
            background: 'linear-gradient(135deg, #e07c42 0%, #f5c880 60%, #e8a84a 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
          404
        </motion.div>

        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Page not found</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, lineHeight: 1.6, marginBottom: 36 }}>
          This page doesn't exist or you don't have permission to access it.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate(-1)}
            className="btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', fontSize: 14 }}>
            <ArrowLeft style={{ width: 15, height: 15 }} /> Go Back
          </button>
          <Link to="/" className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', fontSize: 14 }}>
            <Home style={{ width: 15, height: 15 }} /> Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

