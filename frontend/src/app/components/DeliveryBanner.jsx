import { Package } from "lucide-react";
import "./deliveryBanner.css";

export default function DeliveryBanner({ title, subtitle, icon: Icon = Package }) {
  return (
    <section className="delivery-hero-banner">
      <div className="delivery-hero-icon"><Icon size={52} strokeWidth={2.2} /></div>
      <div className="delivery-hero-copy">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <i />
      </div>
    </section>
  );
}
