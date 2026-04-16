import { userModel } from "../user/user.repository";

export const authRepository = {
  async findByEmail(email: string) {
    return userModel.findByEmail(email);
  },

  async findById(id: string) {
    return userModel.findById(id);
  },
};
