import type { NextConfig } from "next";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
  i18n: {
    // 어플리케이션에서 지원할 언어 리스트
    locales: ['en', 'ko'],
		// default로 설정할 locale
    defaultLocale: 'ko',
  },
};

export default withFlowbiteReact(nextConfig);
