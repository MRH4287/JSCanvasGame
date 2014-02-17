using MapEditor.Elements;
using MapEditor.GUIElements;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Imaging;

namespace MapEditor
{
    class MapController
    {
        StackPanel MapHolder = null;


        public Dictionary<string, ElementDefinition> Elements { get; private set; }

        private MapTile selected = null;
        
        public MapController(StackPanel holder)
        {
            this.MapHolder = holder;
        }


        public void LoadConfig(string path)
        {
            if (Directory.Exists(path))
            {
                FileInfo info = new FileInfo(path + "elements.json");

                var reader = info.OpenText();
                var content = reader.ReadToEnd();

                reader.Close();

                var elements = ElementDefinition.Create(content);

                Elements = elements.ToDictionary(el => el.ID);

                
                //----------------

                info = new FileInfo(path + "map.json");
                reader = info.OpenText();
                content = reader.ReadToEnd();

                reader.Close();

                var map = Tile.Create(content, Elements);


                foreach (var row in map)
                {
                    var rowContainer = getRowContainer();

                    foreach (var collom in row)
                    {
                        var tile = MapTile.Create(collom);
                        tile.MouseDown += tile_MouseDown;
                        rowContainer.Children.Add(tile);

                    }
                    MapHolder.Children.Add(rowContainer);

                }


            }



        }


        public void addRow(params MapTile[] elements)
        {
            var container = getRowContainer();

            foreach (var item in elements)
            {
                container.Children.Add(item);
            }

            MapHolder.Children.Add(container);
        }


        public void addRow(int count = 10, params string[] path)
        {
            var container = getRowContainer();

            for (int i = 0; i < count; i++ )
            {
                var tile = new MapTile();
                if (i < path.Length)
                {
                    if (path[i] != null)
                    {
                        tile.MiddleLayerImage = new BitmapImage(MapTile.GetAbsoluteUri(path[i]));
                    }

                }

                tile.MouseDown += tile_MouseDown;

                container.Children.Add(tile);
            }

            MapHolder.Children.Add(container);

        }

        void tile_MouseDown(object sender, System.Windows.Input.MouseButtonEventArgs e)
        {
            if (selected != null)
            {
                selected.Selected = false;
            }

            selected = (MapTile)sender;
            selected.Selected = true;

        }

        public StackPanel getRowContainer()
        {
            StackPanel panel = new StackPanel();
            panel.HorizontalAlignment = System.Windows.HorizontalAlignment.Left;
            panel.Orientation = Orientation.Horizontal;
            panel.Background = Brushes.Blue;

            return panel;
        }



    }
}
