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
        WrapPanel TileHolder = null;

        public Dictionary<string, ElementDefinition> Elements { get; private set; }

        public MapTile Selected { get; private set; }
        public TileImage SelectedTileImage { get; private set; }
        public TileCommand SelectedTileCommand { get; private set; }

        private LinkedList<TileCommand> CommandElements = new LinkedList<TileCommand>();

        private CommandState state = CommandState.Select;

        private bool isMouseDown = false;


        public MapController(StackPanel holder, WrapPanel tileHolder)
        {
            this.MapHolder = holder;
            this.TileHolder = tileHolder;

            foreach (var item in TileHolder.Children)
            {
                if (item is TileCommand)
                {
                    var element = (TileCommand)item;

                    element.MouseDown += (sender, e) =>
                        {
                            TileCommand commandElement = (TileCommand)sender;

                            if (SelectedTileCommand != null)
                            {
                                SelectedTileCommand.Selected = false;
                            }
                            if (SelectedTileImage != null)
                            {
                                SelectedTileImage.Selected = false;
                                SelectedTileImage = null;
                            }

                            commandElement.Selected = true;
                            SelectedTileCommand = commandElement;

                            state = commandElement.Command;

                        };

                    CommandElements.AddLast(element);

                }

            }

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


                this.TileHolder.Children.Clear();

                foreach (var item in this.CommandElements)
                {
                    this.TileHolder.Children.Add(item);
                }

                foreach (var item in Elements)
                {
                    var tileImage = new TileImage(item.Value);

                    tileImage.MouseDown += tileImage_MouseDown;

                    this.TileHolder.Children.Add(tileImage);
                }


                //----------------

                info = new FileInfo(path + "map2.json");
                reader = info.OpenText();
                content = reader.ReadToEnd();

                reader.Close();

                var map = Tile.Create(content, Elements);


                foreach (var row in map)
                {
                    addRow(row);

                }


            }



        }

        void tileImage_MouseDown(object sender, System.Windows.Input.MouseButtonEventArgs e)
        {
            if (this.SelectedTileImage != null)
            {
                SelectedTileImage.Selected = false;
            }
            if (this.SelectedTileCommand != null)
            {
                SelectedTileCommand.Selected = false;
                SelectedTileCommand = null;
            }

            state = CommandState.Paint;

            SelectedTileImage = (TileImage)sender;
            SelectedTileImage.Selected = true;
        }


        public void addRow(IEnumerable<Tile> elements)
        {
            var mapTileArray = elements.Select(el => MapTile.Create(el)).ToArray();

            foreach (var tile in mapTileArray)
            {
                tile.MouseDown += tile_MouseDown;
                tile.MouseMove += tile_MouseMove;
                tile.MouseUp += tile_MouseUp;

            }

            addRow(mapTileArray);
        }


        public void addRow(IEnumerable<MapTile> elements)
        {
            var container = getRowContainer();

            foreach (var item in elements)
            {
                container.Children.Add(item);
            }

            MapHolder.Children.Add(container);
        }


        
        public void addRow(int count = 10)
        {
            var container = getRowContainer();

            for (int i = 0; i < count; i++)
            {
                var tile = new MapTile();
                tile.Tile = new Tile();

                if (Elements != null)
                {
                    tile.BottomElement = Elements["grass"];
                }

                tile.MouseDown += tile_MouseDown;
                tile.MouseMove += tile_MouseMove;
                tile.MouseUp += tile_MouseUp;

                

                container.Children.Add(tile);
            }

            MapHolder.Children.Add(container);

        }

        private void draw(ElementDefinition def, MapTile destination)
        {
            switch (def.Level)
            {
                case ElementLevel.Bottom:
                    destination.BottomElement = def;
                    break;
                case ElementLevel.Middle:
                    destination.MiddleElement = def;
                    break;
                case ElementLevel.Top:
                    destination.TopElement = def;
                    break;
                default:
                    break;
            }
        }

        void tile_MouseDown(object sender, System.Windows.Input.MouseButtonEventArgs e)
        {
            isMouseDown = true;

            MapTile source = (MapTile)sender;

            execMouseEvent(source);
        }

        private void execMouseEvent(MapTile source)
        {
            if (source == null)
            {
                throw new ArgumentNullException();
            }

            if (Selected != null)
            {
                Selected.Selected = false;
            }

            Selected = source;
            Selected.Selected = true;


            if ((state == CommandState.Paint) && (this.SelectedTileImage != null))
            {
                draw(SelectedTileImage.Element, source);
            }
            else if (state == CommandState.ClearAll)
            {
                source.BottomElement = null;
                source.TopElement = null;
                source.MiddleElement = null;
            }
            else if (state == CommandState.ClearBottom)
            {
                source.BottomElement = null;
            }
            else if (state == CommandState.ClearMiddle)
            {
                source.MiddleElement = null;
            }
            else if (state == CommandState.ClearTop)
            {
                source.TopElement = null;
            }
        }

        void tile_MouseUp(object sender, System.Windows.Input.MouseButtonEventArgs e)
        {
            this.isMouseDown = false;
        }

        void tile_MouseMove(object sender, System.Windows.Input.MouseEventArgs e)
        {
            if (isMouseDown)
            {
                MapTile source = (MapTile)sender;
                execMouseEvent(source);
            }
        }


        public string Serialize()
        {
            List<List<Tile>> mapData = new List<List<Tile>>();

            foreach (var row in MapHolder.Children)
            {
                if (row is StackPanel)
                { 
                    var rowPanel = ((StackPanel)row).Children;
                    List<Tile> tileList = new List<Tile>(rowPanel.Count);

                    foreach(var tile in rowPanel)
                    {
                        if (tile is MapTile)
                        {
                            tileList.Add(((MapTile)tile).Tile);
                        }
                    }

                    mapData.Add(tileList);
                }
            }

            string result = Data.JSON.JSONSerializer.serialize<List<List<Tile>>>(mapData);

            return null;
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
