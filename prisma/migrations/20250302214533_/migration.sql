-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_category_fkey" FOREIGN KEY ("category") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
