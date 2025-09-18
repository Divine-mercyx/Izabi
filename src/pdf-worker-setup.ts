import { pdfjs } from "react-pdf";
import workerSrc from "pdfjs-dist/build/pdf.worker.min";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
