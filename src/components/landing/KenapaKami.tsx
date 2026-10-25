import { KENAPA_ITEMS } from "./content";

export function KenapaKami() {
  return (
    <section className="kenapa-section" id="kenapa" style={{ scrollMarginTop: "var(--navbar-offset)" }}>
      <div className="kenapa-header reveal">
        <div>
          <p className="kenapa-tag">KENAPA KAMI</p>
          <h2 className="kenapa-title">
            EMPAT ALASAN
            <br />
            KAMU AKAN KEMBALI
          </h2>
        </div>
        <p className="kenapa-desc">Dari dapur kecil sampai melayani acara besar, caranya tetap sama: sabar, jujur pada rasa.</p>
      </div>
      <div className="kenapa-grid">
        {KENAPA_ITEMS.map((item) => (
          <div className="kenapa-item reveal" key={item.num}>
            <span className="kenapa-num">{item.num}</span>
            <h3 className="kenapa-item-title">{item.title}</h3>
            <p>{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}