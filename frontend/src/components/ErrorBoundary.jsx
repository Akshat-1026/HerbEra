import { Component } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { withTranslation } from "react-i18next";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8F4EF] dark:bg-zinc-950 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/40 rounded-3xl mb-6">
              <AlertTriangle size={40} className="text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">{this.props.t("errorBoundary.heading")}</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8">
              {this.state.error?.message || this.props.t("errorBoundary.message")}
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-5 py-3 rounded-xl font-medium hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
              >
                <RefreshCw size={18} />
                {this.props.t("errorBoundary.reload")}
              </button>
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
              >
                <Home size={18} />
                {this.props.t("errorBoundary.home")}
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default withTranslation()(ErrorBoundary);
