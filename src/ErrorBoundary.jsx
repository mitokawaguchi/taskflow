import { Component } from 'react'

/**
 * 子コンポーネントで未捕捉のエラーが起きても、真っ黒にならずメッセージを表示する
 */
export class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#0e0e12',
            color: '#e4e4e7',
            padding: '24px',
            fontFamily: 'system-ui, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
          }}
        >
          <div style={{ fontSize: '20px', fontWeight: 600 }}>⚠️ エラーが発生しました</div>
          <pre
            style={{
              maxWidth: '100%',
              overflow: 'auto',
              padding: '12px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '8px',
              fontSize: '13px',
            }}
          >
            {this.state.error?.message ?? String(this.state.error)}
          </pre>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            style={{
              padding: '8px 16px',
              background: '#22c55e',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            再試行
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
