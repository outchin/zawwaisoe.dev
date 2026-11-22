import type { Architecture } from "@/components/arch/types";
import { marketPricePro } from "./market-price-pro";

/**
 * Interactive architecture diagrams, keyed by project slug (the slug set in
 * /admin/projects). A project with an entry here gets an "Architecture"
 * section in its case study. See docs/ARCHITECTURE-DIAGRAMS.md.
 */
export const architectures: Record<string, Architecture> = {
  "market-price-pro": marketPricePro,
};
