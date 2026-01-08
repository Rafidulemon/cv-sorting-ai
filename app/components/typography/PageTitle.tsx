type PageTitleProps = {
  title: string;
};
const PageTitle = ({ title }: PageTitleProps) => {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-primary-200/60 bg-primary-50/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-700">
      <span className="h-2 w-2 rounded-full bg-amber-300" />
      {title}
    </div>
  );
};

export default PageTitle;
