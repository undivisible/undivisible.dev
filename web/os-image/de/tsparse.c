#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "tree_sitter/api.h"

TSLanguage *tree_sitter_holyc(void);
TSLanguage *tree_sitter_lolcode(void);

int main(int argc, char **argv) {
  if (argc < 2) {
    fprintf(stderr, "usage: %s <file>\n", argv[0]);
    return 2;
  }
  FILE *f = fopen(argv[1], "rb");
  if (!f) {
    fprintf(stderr, "%s: cannot open\n", argv[1]);
    return 1;
  }
  fseek(f, 0, SEEK_END);
  long n = ftell(f);
  fseek(f, 0, SEEK_SET);
  char *src = malloc((size_t)n + 1);
  if (!src || fread(src, 1, (size_t)n, f) != (size_t)n) return 1;
  src[n] = 0;
  fclose(f);

  TSParser *p = ts_parser_new();
  ts_parser_set_language(p, TS_LANG());
  TSTree *tree = ts_parser_parse_string(p, NULL, src, (uint32_t)n);
  char *s = ts_node_string(ts_tree_root_node(tree));

  int depth = 0;
  for (char *c = s; *c; c++) {
    if (*c == '(') {
      if (c != s) {
        putchar('\n');
        for (int i = 0; i < depth; i++) fputs("  ", stdout);
      }
      depth++;
      putchar(*c);
    } else if (*c == ')') {
      depth--;
      putchar(*c);
    } else {
      putchar(*c);
    }
  }
  putchar('\n');
  return 0;
}
