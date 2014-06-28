using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ArgumentParser;
using GraphicLibary;
using System.IO;
using System.Drawing;

namespace SpriteSplitter
{
    class Program
    {
        static void Main(string[] args)
        {
            CommandLineParser parser = new CommandLineParser();

            var dataPath = parser.create("-path", "-p");
            var dataColums = new IntegerConsoleCommand("-columns", "-c");
            var dataRows = new IntegerConsoleCommand("-rows", "-r");
            var dataInitialOffsetX = new IntegerConsoleCommand("-initialOffsetX", "-initX");
            var dataInitialOffsetY = new IntegerConsoleCommand("-initialOffsetY", "-initY");
            var dataOffsetX = new IntegerConsoleCommand("-offsetX", "-oX");
            var dataOffsetY = new IntegerConsoleCommand("-offsetY", "-oY");
            var dataTileSizeX = new IntegerConsoleCommand("-tileSizeX", "-sizeX");
            var dataTileSizeY = new IntegerConsoleCommand("-tileSizeY", "-sizeY");
            var dataOutputPath = parser.create("-output", "-out");
            var dataCreateDataSheet = parser.create("-dataSheet", "-sheet");

            parser.register(dataColums);
            parser.register(dataRows);
            parser.register(dataOffsetX);
            parser.register(dataOffsetY);
            parser.register(dataTileSizeX);
            parser.register(dataTileSizeY);
            parser.register(dataInitialOffsetX);
            parser.register(dataInitialOffsetY);

            parser.parse(args);

            if ((!dataPath.HasValue) || (!dataOutputPath.HasValue))
            {
                Console.Out.WriteLine("This Application needs at least the Arguments: -path and -output!");
                return;
            }

            var path = dataPath.Value;
            int columns = (dataColums.HasValue) ? dataColums.ValueInt : 59;
            int rows = (dataRows.HasValue) ? dataRows.ValueInt : 28;
            var initialOffsetX = (dataInitialOffsetX.HasValue) ? dataInitialOffsetX.ValueInt : 0;
            var initialOffsetY = (dataInitialOffsetY.HasValue) ? dataInitialOffsetY.ValueInt : 0;
            var offsetX = (dataOffsetX.HasValue) ? dataOffsetX.ValueInt : 1;
            var offsetY = (dataOffsetY.HasValue) ? dataOffsetY.ValueInt : 1;
            var tileSizeX = (dataTileSizeX.HasValue) ? dataTileSizeX.ValueInt : 16;
            var tileSizeY = (dataTileSizeY.HasValue) ? dataTileSizeY.ValueInt : 16;
            var outputPath = dataOutputPath.Value;
            bool createDataSheet = (dataCreateDataSheet.HasValue && ((dataCreateDataSheet.Value.ToLower() == "true")
                || (dataCreateDataSheet.Value.ToLower() == "yes")
                || (dataCreateDataSheet.Value.ToLower() == "1")));



            if (!File.Exists(path))
            {
                Console.Out.WriteLine("Can't find File: {0}", path);
                return;
            }

            if (!Directory.Exists(outputPath))
            {
                Directory.CreateDirectory(outputPath);
            }

            var input = new GraphicHelper((Bitmap)Bitmap.FromFile(path));
            var output = new GraphicHelper(input.Width * 2, input.Height * 2);

            output.drawImage(input, input.Width * 2, input.Height * 2, 0, 0);

            for (int x = 0; x < columns; x++)
            {
                var XPos = x * (tileSizeX + offsetX) + initialOffsetX;

                if (XPos > input.Width)
                {
                    Console.Out.WriteLine("X Position is greater than the Image Size. Position: {0} Width: {1}", XPos, input.Width);
                    continue;
                }

                for (int y = 0; y < rows; y++)
                {
                    var YPos = y * (tileSizeY + offsetY) + initialOffsetY;

                    if (YPos > input.Height)
                    {
                        Console.Out.WriteLine("Y Position is greater than the Image Size. Position: {0} Height: {1}", YPos, input.Height);
                        continue;
                    }

                    var fileName = String.Format("{0}/{1}-{2}.png", outputPath, x, y);

                    var split = new GraphicHelper(tileSizeX, tileSizeY);

                    split.drawImage(input, XPos, YPos, tileSizeX, tileSizeY, 0, 0);

                    Color? lastColor = null;

                    bool isOk = false;
                    for (int pixX = 0; pixX < split.Width; pixX++)
                    {
                        if (isOk)
                        {
                            break;
                        }

                        for (int pixY = 0; pixY < split.Height; pixY++)
                        {
                            if (isOk)
                            {
                                break;
                            }

                            Color currentColor = split.flush().GetPixel(pixX, pixY);
                            if ((lastColor != null) && lastColor.HasValue)
                            {
                                if (lastColor.Value != currentColor)
                                {
                                    isOk = true;
                                    break;
                                }
                            }

                            lastColor = currentColor;
                        }
                    }

                    if (!isOk)
                    {
                        Console.WriteLine("Ignore Image at {0} / {1} - it has only one color!", x, y);
                        continue;
                    }
                    
                    using (FileStream stream = File.Open(fileName, FileMode.Create))
                    {
                        split.flush().Save(stream, System.Drawing.Imaging.ImageFormat.Png);

                        stream.Close();
                    }

                    output.writeString(String.Format("{0}/{1}", x, y), XPos * 2 + 2, YPos * 2 + 2, System.Drawing.Color.Black, new Font(FontFamily.GenericSansSerif, 5, FontStyle.Regular));

                }



            }

            if (createDataSheet)
            {
                output.flush().Save(String.Format("{0}/data.png", outputPath), System.Drawing.Imaging.ImageFormat.Png);
            }

        }



    }
}
