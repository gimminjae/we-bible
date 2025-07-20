"use client"

import { Breadcrumb, BreadcrumbItem } from "flowbite-react"
import { ReactNode } from "react"

interface BreadCrumbItem {
  icon?: ReactNode
  text: string
  action: () => void
}

interface BreadCrumbProps {
  breadCrumbs: BreadCrumbItem[]
  className?: string
}

export default function BreadCrumb({ breadCrumbs, className }: BreadCrumbProps) {
  return (
    <Breadcrumb aria-label="Breadcrumb" className={className}>
      {breadCrumbs.map((breadcrumb) => (
        <BreadcrumbItem
          className="cursor-pointer"
          key={breadcrumb.text}
          icon={breadcrumb.icon as any}
          onClick={breadcrumb.action}
        >
          {breadcrumb.text}
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  )
}
