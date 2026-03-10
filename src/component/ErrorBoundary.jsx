import { ShieldAlert } from 'lucide-react';
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (

        <div style={{ paddingTop: '250px', textAlign: 'center', color: '#fff', fontSize: '2rem' }}>
          <ShieldAlert size={48} className="mx-auto mb-4 " />
          <h2>Ocurrió un error inesperado.</h2>
          <p>Por favor, recarga la página o vuelve más tarde.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
