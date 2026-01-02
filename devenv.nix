{ pkgs, lib, config, ... }:
{
  languages = {
    javascript = {
      enable = true;
      package = pkgs.nodejs_24;
      bun.enable = true;
    };
  };
}
