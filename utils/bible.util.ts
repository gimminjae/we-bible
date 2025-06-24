// const bibleUtil = {
  
//   summarizeRanges: (nums: any[]) => {
//     if (!nums.length) return ""
  
//     // 배열을 정렬
//     nums.sort((a, b) => a - b)
  
//     let ranges = []
//     let start = nums[0]
//     let end = nums[0]
  
//     for (let i = 1; i < nums.length; i++) {
//       if (nums[i] === end + 1) {
//         // 현재 숫자가 이전 숫자와 연속되면 end를 갱신
//         end = nums[i]
//       } else {
//         // 연속되지 않는 경우 현재 구간을 저장하고 새로운 구간 시작
//         ranges.push(start === end ? `${start}` : `${start}-${end}`)
//         start = nums[i]
//         end = nums[i]
//       }
//     }
  
//     // 마지막 구간 추가
//     ranges.push(start === end ? `${start}` : `${start}-${end}`)
  
//     // 문자열로 결합하여 반환
//     return ranges.join(",")
//   },
  
//   makeCopyBibles: (contentList: any[]) => {
//     if (!contentList?.length) return
//     contentList.sort((a: any, b: any) => a.verse - b.verse)
//     const verses = contentList
//       .map((content: any) =>
//         content.content.startsWith("[")
//           ? content.content.replace(/\[.*?\]/g, "").trim()
//           : content.content
//       )
//       .join("\n\n")
//     const bookName = contentList[0].bookName
//     const chapterVerse = `${contentList[0].chapter}:${bibleUtil.summarizeRanges(
//       contentList?.map((content: any) => content.verse)
//     )}`
//     return `${verses}\n${bookName} ${chapterVerse}`
//   }
// }

// export default bibleUtil