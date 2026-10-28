import type { Metadata as NextMetadata, ResolvingMetadata as NextResolvingMetadata, Viewport as NextViewport } from "next/dist/lib/metadata/types/metadata-interface";
import type { Manifest as NextManifest } from "next/dist/lib/metadata/types/manifest-types";
import type { Robots as NextRobots } from "next/dist/lib/metadata/types/robots-types";
import type { Sitemap as NextSitemap } from "next/dist/lib/metadata/types/sitemap-types";

declare module "next" {
  export type Metadata = NextMetadata;
  export type ResolvingMetadata = NextResolvingMetadata;
  export type Viewport = NextViewport;
  export namespace MetadataRoute {
    export type Manifest = NextManifest;
    export type Robots = NextRobots;
    export type Sitemap = NextSitemap;
  }
}

declare module "next/types.js" {
  export type Metadata = NextMetadata;
  export type ResolvingMetadata = NextResolvingMetadata;
  export type Viewport = NextViewport;
  export namespace MetadataRoute {
    export type Manifest = NextManifest;
    export type Robots = NextRobots;
    export type Sitemap = NextSitemap;
  }
}

declare module "next/types" {
  export type Metadata = NextMetadata;
  export type ResolvingMetadata = NextResolvingMetadata;
  export type Viewport = NextViewport;
  export namespace MetadataRoute {
    export type Manifest = NextManifest;
    export type Robots = NextRobots;
    export type Sitemap = NextSitemap;
  }
}
