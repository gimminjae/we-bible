"use server"

import { BibleVerse } from "@/domain/bible/bible"
import { List, ListItem } from "flowbite-react"

interface Props {
  bible: BibleVerse[]
  bible2?: BibleVerse[]
  fontSize?: number
}
async function BibleView({ bible, bible2, fontSize = 20 }: Props) {
  return (
    <>
    {/* "mx-auto lg:w-[60%] md:w-[80%] sm:w-[80%]" */}
      <div className="">
        <List unstyled>
          {bible?.map((verse: BibleVerse, index: number) => (
            <ListItem className="p-1" key={verse.verse}>
              <div className="flex gap-2">
                <span>{verse.verse}</span>
                <div className="flex flex-col">
                  <p style={fontSize ? { fontSize: `${fontSize}px` } : {}}>
                    {verse.content}
                  </p>
                  {bible2 && (
                    <p style={fontSize ? { fontSize: `${fontSize}px` } : {}}>
                      {bible2[index].content}
                    </p>
                  )}
                </div>
              </div>
            </ListItem>
          ))}
        </List>
      </div>
    </>
  )
}

export default BibleView
