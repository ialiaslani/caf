export function GlobalStyles() {
  return (
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      ::-webkit-scrollbar {
        width: 8px;
      }
      ::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
      }
      ::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 4px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #999;
      }
    `}</style>
  );
}
