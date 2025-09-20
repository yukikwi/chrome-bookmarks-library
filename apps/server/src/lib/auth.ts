import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema/auth";
import { genericOAuth } from "better-auth/plugins";

console.log(process.env.BACKEND_URL + "/api/auth/callback/yuki2th")
export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",

		schema: schema,
	}),
	trustedOrigins: [process.env.CORS_ORIGIN || ""],
	emailAndPassword: {
		enabled: false,
	},
	plugins: [
		genericOAuth({ 
            config: [ 
                { 
                    providerId: "yuki2th", 
                    clientId: process.env.YUKI2TH_OIDC_CLIENT_ID!, 
                    clientSecret: process.env.YUKI2TH_OIDC_CLIENT_SECRET!, 
                    discoveryUrl: "https://authentik.yuki2th.xyz/application/o/library-yuki2th/.well-known/openid-configuration",
					authorizationUrl: "https://authentik.yuki2th.xyz/application/o/authorize/",
					redirectURI: process.env.BACKEND_URL + "/api/auth/oauth2/callback/yuki2th",
				}, 
            ] 
        }) 
	],
	advanced: {
		defaultCookieAttributes: {
			sameSite: "none",
			secure: true,
			httpOnly: true,
		},
	},
});
