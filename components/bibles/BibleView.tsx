"use server"

import { BibleVerse } from "@/domain/bible/bible"
import { List, ListItem } from "flowbite-react"

interface Props {
  bible: BibleVerse[]
  bible2?: BibleVerse[]
}

async function BibleView({ bible, bible2 }: Props) {
  return (
    <>
      {/* "mx-auto lg:w-[60%] md:w-[80%] sm:w-[80%]" */}
      <div className="px-5">
        <List unstyled>
          {bible?.map((verse: BibleVerse, index: number) => (
            <ListItem className="p-1" key={`${verse.verse}-${index}`}>
              <div className="flex gap-2">
                <span className="verse-number text-gray-600 font-medium" style={{ fontSize: 'var(--verse-size)' }}>{verse.verse}</span>
                <div className="flex flex-col gap-1">
                  <p className="verse-content leading-relaxed" style={{ fontSize: 'var(--font-size)' }}>
                    {verse.content}
                  </p>
                  {bible2 && (
                    <p className="verse-content text-gray-600 leading-relaxed" style={{ fontSize: 'var(--font-size)' }}>
                      {bible2[index]?.content}
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
