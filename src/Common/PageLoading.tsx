import { Loader2 } from 'lucide-react';
import { layoutTheme } from "../Themes/ComponentsThems/LayoutTheme";

const PageLoading = () => {
  return (
    <div className="h-96 flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${layoutTheme.loading.spinner}`} size={32} />
      <p className={`${layoutTheme.loading.text}`}>Syncing directory...</p>
    </div>
  )
}

export default PageLoading
