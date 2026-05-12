import React from "react";
import whiteLogo from "@/assets/white-logo.png";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AuthHeader({ title, description }) {
  return (
    <CardHeader className="space-y-3 flex flex-col items-center text-center">
      <a href="/">
        <img
          src={whiteLogo}
          alt="JamSheet Logo"
          className="w-12 h-12 rounded-full object-cover mb-2"
        />
      </a>
      <CardTitle className="text-2xl font-bold">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  );
}
