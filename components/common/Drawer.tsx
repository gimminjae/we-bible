"use client"

import { Button, Drawer, DrawerHeader, DrawerItems } from "flowbite-react"
import { ReactNode, useState } from "react"
import { HiBars2, HiSquaresPlus } from "react-icons/hi2"

interface DrawerComponentProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  items?: ReactNode[]
}

export default function DrawerComponent({
  isOpen,
  setIsOpen,
  items = []
}: DrawerComponentProps) {
  const handleClose = () => {
    setIsOpen(false)
  }

  const handleOpen = () => {
    setIsOpen(true)
  }

  return (
    <>
      <Drawer
        open={isOpen}
        onClose={handleClose}
        position="bottom"
        className="p-0 z-99"
      >
        <DrawerHeader
          closeIcon={HiBars2}
          title="Add widget"
          titleIcon={HiSquaresPlus}
          onClick={() => setIsOpen(!isOpen)}
          className="cursor-pointer px-4 pt-4 hover:bg-gray-50 dark:hover:bg-gray-700"
        />
        <DrawerItems className="p-4">
          <div className="grid xs:grid-cols-1sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="cursor-pointer rounded-lg bg-gray-50 p-4 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                {item}
              </div>
            ))}
          </div>
        </DrawerItems>
      </Drawer>
    </>
  )
}
