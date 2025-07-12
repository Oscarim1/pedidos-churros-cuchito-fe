import jsPDF from 'jspdf';
import { format } from 'date-fns';

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  products: {
    name: string;
    category: string;
    points: number;
  };
}

export interface Order {
  id: string;
  order_number: number;
  total: number;
  created_at: string;
  order_items: OrderItem[];
}

/**
 * Genera un jsPDF en formato [164×600] idéntico al backend
 */
export function generatePDF(
  order: Order,
  items: OrderItem[],
  title: string,
): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: [164, 600] });
  const pageWidth = doc.internal.pageSize.width;
  const centerX = pageWidth / 2;
  const margin = 10;

  let yPos = 10;
  doc.setFont('Courier');

  // logo
  doc.addImage(
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-KloLHRepjExrJHt918Q2VWb4HdWvmT.png',
    'PNG',
    margin,
    yPos,
    pageWidth - margin * 2,
    25,
    undefined,
    'FAST',
  );
  yPos += 35;

  // header
  doc.setFontSize(14);
  doc.text(`PEDIDO #${order.order_number}`, centerX, yPos, { align: 'center' });
  yPos += 20;
  doc.text(title, centerX, yPos, { align: 'center' });
  yPos += 20;

  // fecha
  doc.setFontSize(10);
  const dateStr = format(new Date(order.created_at), 'dd/MM/yyyy HH:mm');
  doc.text(`Fecha: ${dateStr}`, centerX, yPos, { align: 'center' });
  yPos += 15;

  // separador
  const sep = '*'.repeat(20);
  doc.text(sep, centerX, yPos, { align: 'center' });
  yPos += 15;

  // items
  doc.setFontSize(10);
  const maxWidth = pageWidth - margin * 2 - 40;

  items.forEach((item) => {
    const text = `${item.quantity}x ${item.products.name}`;
    if (doc.getTextWidth(text) > maxWidth) {
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line) => {
        if (yPos > 570) {
          doc.addPage();
          yPos = 10;
        }
        doc.text(line, margin, yPos);
        yPos += 12;
      });
    } else {
      if (yPos > 570) {
        doc.addPage();
        yPos = 10;
      }
      doc.text(text, margin, yPos);
    }
    const price = `$${item.price.toLocaleString('es-CL', { minimumFractionDigits: 0 })}`;
    doc.text(price, pageWidth - margin, yPos, { align: 'right' });
    yPos += 20;
  });

  return doc;
}
