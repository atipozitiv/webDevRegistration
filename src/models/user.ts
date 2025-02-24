import { CallbackError, model, Model, Schema } from "mongoose";
import bcrypt from "bcrypt";

interface IUser {
  username: string;
  password: string;
}

interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

type UserModel = Model<IUser, object, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

userSchema.pre("save", async function (next) {
  // Если пароль не изменен, переходим к следующему middleware
  if (!this.isModified("password")) return next();

  try {
    // Генерация соли
    const salt = await bcrypt.genSalt(10);

    // Хеширование пароля
    const hash = await bcrypt.hash(this.password, salt);

    // Заменяем пароль на хеш
    this.password = hash;

    // Переходим к следующему middleware
    next();
  } catch (err) {
    return next(err as CallbackError);
  }
});

userSchema.method(
  "comparePassword",
  async function (candidatePassword: string) {
    return await bcrypt.compare(candidatePassword, this.password);
  },
);

export const UserModel = model<IUser, UserModel>("User", userSchema);