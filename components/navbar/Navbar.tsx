import {
  Button,
  DarkThemeToggle,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from "flowbite-react";
import Image from "next/image";

export default function NavbarComponent() {
  return (
    <Navbar fluid>
      <NavbarBrand href="https://flowbite-react.com">
        <Image
          src="/favicon.ico"
          className="mr-3 h-6 sm:h-9"
          alt="We Bible"
          width={36}
          height={36}
        />
        <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
          We Bible
        </span>
      </NavbarBrand>
      <div className="flex gap-1 md:order-2">
        <DarkThemeToggle className="cursor-pointer" />
        <Button className="cursor-pointer">로그인</Button>
        <NavbarToggle />
      </div>
      <NavbarCollapse>
        <NavbarLink href="#" active>
          Home
        </NavbarLink>
        <NavbarLink href="#">About</NavbarLink>
        <NavbarLink href="#">Services</NavbarLink>
        <NavbarLink href="#">Pricing</NavbarLink>
        <NavbarLink href="#">Contact</NavbarLink>
      </NavbarCollapse>
    </Navbar>
  );
}
