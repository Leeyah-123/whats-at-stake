// import { AuthOptions } from 'next-auth';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import { SigninMessage } from './SigninMessage';
// import { User } from '@/lib/db/models/user';
// import dbConnect from '@/lib/db/connect';

// if (!process.env.NEXTAUTH_SECRET) {
//   throw new Error('Please define NEXTAUTH_SECRET environment variable');
// }

// export const authOptions: AuthOptions = {
//   secret: process.env.NEXTAUTH_SECRET,
//   providers: [
//     CredentialsProvider({
//       name: 'Solana',
//       credentials: {
//         message: {
//           label: 'Message',
//           type: 'text',
//         },
//         signature: {
//           label: 'Signature',
//           type: 'text',
//         },
//       },
//       async authorize(credentials) {
//         try {
//           const signinMessage = new SigninMessage(
//             JSON.parse(credentials?.message || '{}')
//           );
//           const validationResult = await signinMessage.validate(
//             credentials?.signature || ''
//           );

//           if (!validationResult) {
//             return null;
//           }

//           await dbConnect();

//           let user = await User.findOne({
//             walletAddress: signinMessage.publicKey,
//           });

//           if (!user) {
//             user = await User.create({
//               walletAddress: signinMessage.publicKey,
//               theme: 'system',
//               refreshInterval: 60,
//               alerts: [],
//               favoriteValidators: [],
//               dashboardLayout: ['overview', 'validators', 'network', 'rewards'],
//             });
//           }

//           return {
//             id: user._id.toString(),
//             walletAddress: signinMessage.publicKey,
//           };
//         } catch (e) {
//           return null;
//         }
//       },
//     }),
//   ],
//   session: {
//     strategy: 'jwt',
//   },
//   callbacks: {
//     async session({ session, token }) {
//       session.user.walletAddress = token.walletAddress;
//       return session;
//     },
//     async jwt({ token, user }) {
//       if (user) {
//         token.walletAddress = user.walletAddress;
//       }
//       return token;
//     },
//   },
// };
