import {
  createRootRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import * as React from "react";
import bmmLogo from "/succulents-svgrepo-com.svg";

export const Route = createRootRoute({
  component: RootComponent,
});

const links: {
  text: string;
  to: string;
}[] = [
  {
    text: "Bookmarks",
    to: "/",
  },
  {
    text: "Tags",
    to: "/tags",
  },
] as const;

function RootComponent() {
  const location = useLocation();

  return (
    <React.Fragment>
      <div className="navbar bg-base-100 shadow-sm flex justify-between">
        <div>
          <Link to="/" className="btn btn-ghost text-xl">
            <img className="w-8 h-8" src={bmmLogo} alt="bmm logo" />
            bmm
          </Link>
        </div>
        <div>
          <ul className="menu menu-horizontal px-1 gap-1">
            {links.map((link) => {
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={
                      link.to === location.pathname ? "bg-emerald-200" : ""
                    }
                  >
                    {link.text}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="p-4">
        <Outlet />
      </div>
    </React.Fragment>
  );
}
