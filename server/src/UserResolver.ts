import { Resolver, Query, Mutation, Arg, ObjectType, Field, Ctx, UseMiddleware } from 'type-graphql';
import { hash, compare } from 'bcryptjs';
import { User } from './entity/User';
import { Context } from './Context';
import { createRefreshToken, createAccessToken } from './auth';
import { isAuth } from './isAuthMiddleware';

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;
}

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return 'hi!'
  }

  @Query(() => String)
  @UseMiddleware(isAuth)
  bye(@Ctx() {payload}: Context) {
    console.log(payload);
    return `Your user id is: ${payload!.userId}`;
  }

  @Query(() => [User])
  users() {
    return User.find();
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() {res}: Context
  ): Promise<LoginResponse> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error(`No account accociated with ${email}`);
    }

    const valid = await compare(password, user.password);

    if (!valid) {
      throw new Error('Your credetials do not match');
    }

    res.cookie(
      'lvjwt',
      createRefreshToken(user),
      {
        httpOnly: true
      }
    );

    return {
      accessToken: createAccessToken(user)
    };
  }

  @Mutation(() => Boolean)
  async register(
    @Arg('email') email: string,
    @Arg('password') password: string,
  ) {
    const hashedPassword = await hash(password, 12);

    try {
      await User.insert({
        email,
        password: hashedPassword,
      });
    } catch(err) {
      console.log(err);
      return false;
    }
    return true;
  }
}