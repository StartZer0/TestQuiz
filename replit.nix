{ pkgs }: {
  deps = [
    pkgs.nodejs-20_x
    pkgs.nodePackages.typescript
    pkgs.yarn
    pkgs.replitPackages.jest
    pkgs.postgresql_16
  ];
  env = {
    DATABASE_URL = "$REPLIT_DB_URL";
  };
}
