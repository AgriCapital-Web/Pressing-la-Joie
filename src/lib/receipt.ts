import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatPrice } from "@/lib/constants";

interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
}

interface ReceiptOrder {
  ticket_number: string;
  customer_name: string;
  customer_phone: string;
  items: ReceiptItem[];
  total: number;
  is_paid: boolean;
  created_at: string;
}

export function generateOrderReceiptPdf(order: ReceiptOrder) {
  const doc = new jsPDF({ unit: "mm", format: "a5" });
  const left = 12;
  let y = 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("LA JOIE PRESSING", left, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Daloa • Tél: 07 59 56 60 87", left, y);

  y += 8;
  doc.setDrawColor(190, 190, 190);
  doc.line(left, y, 136, y);

  y += 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`Reçu ${order.ticket_number}`, left, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Client: ${order.customer_name}`, left, y);
  y += 5;
  doc.text(`Contact: ${order.customer_phone || "N/A"}`, left, y);
  y += 5;
  doc.text(`Date: ${format(new Date(order.created_at), "dd/MM/yyyy HH:mm", { locale: fr })}`, left, y);

  y += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Articles", left, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  order.items.forEach((item) => {
    const line = `${item.qty} x ${item.name}`;
    const amount = formatPrice(item.qty * item.price);
    doc.text(line, left, y, { maxWidth: 82 });
    doc.text(amount, 136, y, { align: "right" });
    y += 5;
  });

  y += 2;
  doc.line(left, y, 136, y);
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Total", left, y);
  doc.text(formatPrice(Number(order.total)), 136, y, { align: "right" });

  y += 8;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Paiement: ${order.is_paid ? "Payé" : "Non payé"}`, left, y);

  y += 10;
  doc.setFontSize(8);
  doc.text("Merci pour votre confiance.", left, y);
  doc.text("La propreté, notre métier.", left, y + 4);

  doc.save(`recu-${order.ticket_number}.pdf`);
}
