const fs = require('fs');
const file = 'src/components/ZoneCatalogGrid.tsx';
let content = fs.readFileSync(file, 'utf8');

const inlineMatch = content.match(/<article\s+key=\{item\.id\}[\s\S]*?<\/article>/);
if (!inlineMatch) { console.error('No inline article found'); process.exit(1); }
let inlineArticle = inlineMatch[0];

inlineArticle = inlineArticle.replace(/\s*key=\{item\.id\}/, '');

inlineArticle = inlineArticle.replace(
  /(\{item\.isPremium && \([\s\S]*?<\/div>\r?\n\s*\)\})/,
  `$1\n\n                {/* Favorite + Share */}\n                <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">\n                  <button\n                    onClick={(e) => { e.stopPropagation(); setIsFav(f => !f); }}\n                    aria-label="Save to favorites"\n                    className="w-8 h-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-md hover:bg-white dark:hover:bg-slate-800 transition-all active:scale-90 border border-slate-200/50 dark:border-white/10"\n                  >\n                    <Heart className={\`w-3.5 h-3.5 transition-all duration-300 \${isFav ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-600 dark:text-slate-300'}\`} />\n                  </button>\n                  <div className="relative">\n                    <button\n                      onClick={handleShare}\n                      aria-label="Share listing"\n                      className="w-8 h-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-md hover:bg-white dark:hover:bg-slate-800 transition-all active:scale-90 border border-slate-200/50 dark:border-white/10"\n                    >\n                      <Share2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />\n                    </button>\n                    {copied && (\n                      <span className="absolute top-1/2 right-10 -translate-y-1/2 whitespace-nowrap bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-lg pointer-events-none">\n                        {language === 'amharic' ? 'ተገልብጧል!' : 'Copied!'}\n                      </span>\n                    )}\n                  </div>\n                </div>`
);

inlineArticle = inlineArticle.replace(
  /absolute top-3 right-3 (w-8 h-8 rounded-lg bg-amber-500)/,
  'absolute bottom-3 right-3 $1'
);

const newListingCard = `const ListingCard: React.FC<{
  item: any;
  index: number;
  gridVisible: boolean;
}> = ({ item, index, gridVisible }) => {
  const { language, t } = useLanguage();
  const [isFav, setIsFav] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatPrice = (n: number) => n.toLocaleString();

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(\`https://malazone.com/listing/\${item.id}\`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    ${inlineArticle}
  );
};`;

const regexOldCard = /const ListingCard: React\.FC[\s\S]*?<\/article>\r?\n\};\r?\n/;
content = content.replace(regexOldCard, newListingCard + '\n');

const regexLoop = /\{visibleListings\.map\(\(item, index\) => \(\r?\n\s*<article[\s\S]*?<\/article>\r?\n\s*\)\)\}/;
content = content.replace(regexLoop, `{visibleListings.map((item, index) => (
            <ListingCard key={item.id} item={item} index={index} gridVisible={gridVisible} />
          ))}`);

fs.writeFileSync(file, content);
console.log('Script ran successfully');
