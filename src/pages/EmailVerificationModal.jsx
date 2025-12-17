// EmailVerificationModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EmailVerificationModal = ({ 
  email, 
  userType, 
  debugCode,
  onVerificationSuccess, 
  onClose 
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  
  // Temporizador para reenvío
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Solo números
    if (value.length <= 6) {
      setCode(value);
      setError(''); // Limpiar error al escribir
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/verify-email', {
        email: email,
        code: code
      });

      if (response.data.success) {
        setSuccess('¡Email verificado exitosamente!');
        // Esperar 1.5 segundos antes de redirigir
        setTimeout(() => {
          onVerificationSuccess();
        }, 1500);
      }
    } catch (err) {
      setAttempts(prev => prev + 1);
      
      if (err.response && err.response.data) {
        setError(err.response.data.error || 'Código incorrecto');
      } else {
        setError('Error de conexión. Verifica tu internet.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    
    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://localhost:5000/api/resend-verification', {
        email: email,
        userType: userType
      });

      if (response.data.success) {
        setSuccess('✅ Nuevo código enviado a tu correo');
        setResendCooldown(60); // 60 segundos de espera
        setCode(''); // Limpiar código anterior
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.error || 'Error al reenviar el código');
      } else {
        setError('Error de conexión');
      }
    } finally {
      setResendLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleVerify(e);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Verifica tu Email</h2>
        <button onClick={onClose} style={styles.closeButton}>×</button>
      </div>
      
      <div style={styles.content}>
        <p style={styles.description}>
          Hemos enviado un código de 6 dígitos a:
          <br />
          <strong style={styles.email}>{email}</strong>
        </p>
        
        <div style={styles.tipBox}>
          <p style={styles.tipText}>
            📧 <strong>Revisa tu bandeja de entrada</strong> (y carpeta de spam).
            <br />
            ⏰ El código expira en <strong>24 horas</strong>.
            <br />
            🔢 Ingresa el código a continuación:
          </p>
        </div>

        <form onSubmit={handleVerify}>
          <div style={styles.codeContainer}>
            <input
              type="text"
              value={code}
              onChange={handleCodeChange}
              onKeyDown={handleKeyDown}
              placeholder="000000"
              maxLength={6}
              style={styles.codeInput}
              autoFocus
            />
            <div style={styles.codeHint}>
              {code.length}/6 dígitos
            </div>
          </div>

          {error && (
            <div style={styles.errorContainer}>
              <span style={styles.errorIcon}>⚠️</span>
              <span style={styles.errorText}>{error}</span>
            </div>
          )}

          {success && (
            <div style={styles.successContainer}>
              <span style={styles.successIcon}>✅</span>
              <span style={styles.successText}>{success}</span>
            </div>
          )}

          <div style={styles.buttonContainer}>
            <button
              type="submit"
              style={styles.verifyButton}
              disabled={loading || code.length !== 6}
            >
              {loading ? 'Verificando...' : 'Verificar Código'}
            </button>

            <button
              type="button"
              onClick={handleResendCode}
              style={styles.resendButton}
              disabled={resendLoading || resendCooldown > 0}
            >
              {resendLoading ? 'Enviando...' : 
               resendCooldown > 0 ? `Reenviar (${resendCooldown}s)` : 
               'Reenviar Código'}
            </button>
          </div>
        </form>

        <div style={styles.helpSection}>
          <p style={styles.helpTitle}>¿Problemas con el código?</p>
          <ul style={styles.helpList}>
            <li>Revisa la carpeta de <strong>spam</strong> o <strong>correo no deseado</strong></li>
            <li>Asegúrate de que <strong>{email}</strong> sea correcto</li>
            <li>El código tiene <strong>6 dígitos</strong> (ej: 123456)</li>
            <li>Si no recibes el código, usa el botón "Reenviar Código"</li>
            {attempts > 2 && (
              <li>Si tienes problemas, cierra y vuelve a intentar el registro</li>
            )}
          </ul>
        </div>

        {/* Solo en modo desarrollo - Mostrar código pero NO auto-completar */}
        {debugCode && process.env.NODE_ENV === 'development' && (
          <div style={styles.debugSection}>
            <p style={styles.debugTitle}>🔧 Modo Desarrollo - Código de prueba:</p>
            <div style={styles.debugCodeBox}>
              <strong style={styles.debugCodeText}>{debugCode}</strong>
            </div>
            <p style={styles.debugNote}>
              (Copia y pega este código manualmente)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    background: 'linear-gradient(90deg, #e76bb2, #a18cd1)',
    color: 'white',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '1.5em',
    fontWeight: '600',
  },
  closeButton: {
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: 'white',
    fontSize: '24px',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: '25px',
  },
  description: {
    textAlign: 'center',
    color: '#555',
    marginBottom: '20px',
    lineHeight: '1.5',
  },
  email: {
    color: '#4b2879',
    fontSize: '1.1em',
    wordBreak: 'break-all',
  },
  tipBox: {
    background: '#f0f7ff',
    borderLeft: '4px solid #1890ff',
    padding: '15px',
    marginBottom: '25px',
    borderRadius: '4px',
  },
  tipText: {
    margin: 0,
    fontSize: '0.9em',
    lineHeight: '1.6',
  },
  codeContainer: {
    marginBottom: '20px',
    textAlign: 'center',
  },
  codeInput: {
    fontSize: '2.5em',
    textAlign: 'center',
    letterSpacing: '8px',
    padding: '15px',
    width: '100%',
    maxWidth: '250px',
    border: '3px solid #7b68ee',
    borderRadius: '10px',
    outline: 'none',
    transition: 'all 0.3s',
  },
  codeHint: {
    marginTop: '8px',
    color: '#666',
    fontSize: '0.85em',
  },
  errorContainer: {
    background: '#fff2f0',
    border: '1px solid #ffccc7',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
  },
  errorIcon: {
    marginRight: '10px',
    fontSize: '1.2em',
  },
  errorText: {
    color: '#cf1322',
    fontWeight: '500',
  },
  successContainer: {
    background: '#f6ffed',
    border: '1px solid #b7eb8f',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
  },
  successIcon: {
    marginRight: '10px',
    fontSize: '1.2em',
  },
  successText: {
    color: '#52c41a',
    fontWeight: '500',
  },
  buttonContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  verifyButton: {
    flex: 1,
    padding: '12px',
    background: '#6d4ad9',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '1em',
  },
  resendButton: {
    flex: 1,
    padding: '12px',
    background: '#f0f0f0',
    color: '#333',
    border: '1px solid #d9d9d9',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '1em',
  },
  helpSection: {
    marginTop: '25px',
    padding: '15px',
    background: '#f9f9f9',
    borderRadius: '8px',
  },
  helpTitle: {
    marginTop: 0,
    marginBottom: '10px',
    color: '#333',
    fontWeight: '600',
  },
  helpList: {
    margin: 0,
    paddingLeft: '20px',
    color: '#555',
    fontSize: '0.9em',
    lineHeight: '1.6',
  },
  debugSection: {
    marginTop: '20px',
    padding: '15px',
    background: '#fff8e1',
    border: '1px dashed #ffd666',
    borderRadius: '8px',
  },
  debugTitle: {
    marginTop: 0,
    marginBottom: '10px',
    color: '#d46b08',
    fontWeight: '600',
    fontSize: '0.9em',
  },
  debugCodeBox: {
    background: 'white',
    border: '2px solid #ffd666',
    borderRadius: '8px',
    padding: '15px',
    textAlign: 'center',
    marginBottom: '10px',
  },
  debugCodeText: {
    fontSize: '2em',
    color: '#d48806',
    letterSpacing: '5px',
  },
  debugNote: {
    margin: '5px 0 0 0',
    fontSize: '0.8em',
    color: '#8c8c8c',
    textAlign: 'center',
  },
};

export default EmailVerificationModal;