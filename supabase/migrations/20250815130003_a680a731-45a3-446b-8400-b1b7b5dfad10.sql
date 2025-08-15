-- Add mobile image support to banner_accordion table
ALTER TABLE banner_accordion 
ADD COLUMN image_mobile TEXT;

-- Update the table to make the image column more clear (it will be for desktop)
COMMENT ON COLUMN banner_accordion.image IS 'Image URL for desktop/tablet display';
COMMENT ON COLUMN banner_accordion.image_mobile IS 'Image URL for mobile display (optional)';