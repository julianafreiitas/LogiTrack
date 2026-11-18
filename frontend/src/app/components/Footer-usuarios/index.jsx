"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleLetterC
} from "lucide-react";

export default function Footer() {

    return(
        <footer className="dashboard-footer">
          <p><span><CircleLetterC className="custom-icon1"/></span> 2026 LogiTrack · Sistema de acompanhamento de entregas.</p>
        </footer>
    )
}