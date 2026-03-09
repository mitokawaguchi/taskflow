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
        <div className="error-boundary">
          <div className="error-boundary__message">⚠️ エラーが発生しました</div>
          <pre className="error-boundary__pre">
            {this.state.error?.message ?? String(this.state.error)}
          </pre>
          <button type="button" className="error-boundary__retry" onClick={() => this.setState({ error: null })}>
            再試行
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
