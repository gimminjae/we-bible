"use client"

import { Breadcrumb, BreadcrumbItem } from "flowbite-react"
import { ReactNode } from "react"
import { HiHome } from "react-icons/hi"

interface BreadCrumbItem {
  icon?: ReactNode
  text: string
  action: () => void
}

interface BreadCrumbProps {
  breadCrumbs: BreadCrumbItem[]
}

export default function BreadCrumb({ breadCrumbs }: BreadCrumbProps) {
  return (
    <Breadcrumb aria-label="Default breadcrumb example">
      {breadCrumbs.map((breadcrumb) => (
        <BreadcrumbItem
          key={breadcrumb.text}
          href="#"
          icon={breadcrumb.icon as any}
          onClick={breadcrumb.action}
        >
          {breadcrumb.text}
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  )
}
