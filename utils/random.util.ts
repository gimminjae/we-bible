import { v4 as uuid4v } from "uuid"

const randomUtil = {
  createId() {
    return uuid4v()
  },
}
export default randomUtil