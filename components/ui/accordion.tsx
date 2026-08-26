"use client";

import * as React from "react";
import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * shadcn-shaped accordion built on Base UI rather than Radix.
 *
 * The upstream shadcn accordion imports @radix-ui/react-accordion. This
 * project has no @radix-ui packages at all — it is on the `base-nova` style,
 * which is built on @base-ui/react — so installing Radix would ship a second
 * headless-UI library for one component.
 *
 * The exported names match the shadcn/Radix API (Accordion, AccordionItem,
 * AccordionTrigger, AccordionContent) so components written against that
 * surface drop in unchanged. Two behavioural notes:
 *  - Base UI's Root takes `multiple={false}` where Radix takes
 *    `type="single"`; the wrapper translates it.
 *  - the open trigger carries `data-panel-open`, not `data-state="open"`,
 *    which is what rotates the chevron.
 *  - the height animation reads --accordion-panel-height, which Base UI sets
 *    (Radix sets --radix-accordion-content-height).
 */
const Accordion = React.forwardRef<
  React.ComponentRef<typeof BaseAccordion.Root>,
  Omit<React.ComponentPropsWithoutRef<typeof BaseAccordion.Root>, "multiple"> & {
    /** Radix-compatible alias: "single" maps to multiple={false}. */
    type?: "single" | "multiple";
  }
>(({ className, type = "single", ...props }, ref) => (
  <BaseAccordion.Root
    ref={ref}
    multiple={type === "multiple"}
    className={cn(className)}
    {...props}
  />
));
Accordion.displayName = "Accordion";

const AccordionItem = React.forwardRef<
  React.ComponentRef<typeof BaseAccordion.Item>,
  React.ComponentPropsWithoutRef<typeof BaseAccordion.Item>
>(({ className, ...props }, ref) => (
  <BaseAccordion.Item ref={ref} className={cn("border-b", className)} {...props} />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ComponentRef<typeof BaseAccordion.Trigger>,
  React.ComponentPropsWithoutRef<typeof BaseAccordion.Trigger>
>(({ className, children, ...props }, ref) => (
  <BaseAccordion.Header className="flex">
    <BaseAccordion.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between gap-4 py-4 text-left font-medium transition-all",
        "[&[data-panel-open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </BaseAccordion.Trigger>
  </BaseAccordion.Header>
));
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<
  React.ComponentRef<typeof BaseAccordion.Panel>,
  React.ComponentPropsWithoutRef<typeof BaseAccordion.Panel>
>(({ className, children, ...props }, ref) => (
  <BaseAccordion.Panel
    ref={ref}
    className="overflow-hidden text-sm data-[closed]:animate-accordion-up data-[open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </BaseAccordion.Panel>
));
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
