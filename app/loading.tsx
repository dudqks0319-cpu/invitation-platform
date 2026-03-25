export default function Loading() {
  return (
    <main className="app-shell">
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FDF6EE 0%, #F9EDE0 40%, #F5E4D3 100%)"
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid #E8DDD3",
              borderTopColor: "#C9935A",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px"
            }}
          />
          <p style={{ color: "#8B7355", fontSize: "0.9rem" }}>불러오는 중...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </section>
    </main>
  );
}
