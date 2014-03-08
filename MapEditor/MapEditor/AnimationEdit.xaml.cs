using GraphicLibary;
using MapEditor.Elements;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;

namespace MapEditor
{
    /// <summary>
    /// Interaktionslogik für AnimationEdit.xaml
    /// </summary>
    public partial class AnimationEdit : Window
    {
        AnimationElement def = null;

        Brush[] brushes = new Brush[]
        {
            Brushes.Black,
            Brushes.Red,
            Brushes.Green,
            Brushes.Orange,
            Brushes.Yellow,
            Brushes.Blue,
            Brushes.Brown,
            Brushes.Chocolate,
            Brushes.Gray,
            Brushes.Azure
        };



        public AnimationEdit()
        {
            InitializeComponent();
        }

        private void OpenFile(object sender, RoutedEventArgs e)
        {
            var open = new System.Windows.Forms.OpenFileDialog();
            open.Filter = "Json-File|*.json";

            if (open.ShowDialog() == System.Windows.Forms.DialogResult.OK)
            {
                using (var reader = System.IO.File.OpenText(open.FileName))
                {

                    def = Data.JSON.JSONSerializer.deserialize<AnimationElement>(reader.ReadToEnd());

                    loadFile();
                }


            }

        }

        private void loadFile()
        {
            this.IDInput.DataContext = def;
            this.ImageInput.DataContext = def;

            this.AnimationList.ItemsSource = def.Animations;

            this.AnimationList.SelectedItem = 0;
            this.AnimationContainer.DataContext = def.Animations.First();

            this.AnimationList.SelectionChanged += (s, e) =>
                {
                    this.AnimationContainer.DataContext = (Animation)this.AnimationList.SelectedItem;
                    updateImage();

                };

            updateImage();
        }

        private void updateImage()
        {
            this.TileImage.Source = new BitmapImage(MapController.GetAbsoluteUri(def.ImageURI));

            this.TileImage.Width = this.TileImage.Source.Width;
            this.TileImage.Height = this.TileImage.Source.Height;

            this.ImageCanvas.Width = this.TileImage.Source.Width;
            this.ImageCanvas.Height = this.TileImage.Source.Height;


            this.DrawingCanvas.Width = this.TileImage.Source.Width;
            this.DrawingCanvas.Height = this.TileImage.Source.Height;

            this.DrawingCanvas.Children.Clear();

            int brushCount = 0;

            foreach (var animation in def.Animations)
            {
                // Draw Images:
                var brush = brushes[brushCount % brushes.Length];

                for (int i = 0; i < animation.ImageCount; i++ )
                {
                    var x = animation.StartX + i * animation.OffsetX;
                    var y = animation.StartY + i * animation.OffsetY;

                    addRect(x, y, animation.ImageWidth, animation.ImageHeight, brush);
                }
                    brushCount++;
            }



        }

        private void addRect(int x, int y, int width, int height, Brush brush)
        {
            Rectangle rect = new Rectangle();


            rect.Width = width;
            rect.Height = height;
            rect.Stroke = brush;

            Canvas.SetLeft(rect, x);
            Canvas.SetTop(rect, y);

            this.DrawingCanvas.Children.Add(rect);
        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            if (def == null)
            {
                MessageBox.Show("Please load something ...");
            }
            else
            {
                this.def.Animations.Add(new Animation()
                    {
                        ID = "NewElement"
                    });



            }
        }

        private void Save(object sender, RoutedEventArgs e)
        {
            if (def == null)
            {
                MessageBox.Show("Nothing to save ...");
            }
            else
            {
              
               var dialoge = new System.Windows.Forms.SaveFileDialog();
               dialoge.Filter = "Json-File|*.json";
               if (dialoge.ShowDialog() == System.Windows.Forms.DialogResult.OK)
               {
                   var text = Data.JSON.JSONSerializer.serialize<AnimationElement>(def);

                   using (StreamWriter stream = File.CreateText(dialoge.FileName))
                   {
                       stream.Write(text);
                   }

               }
                 


            }
        }

        private void CopyClick(object sender, RoutedEventArgs e)
        {
            if (def == null)
            {
                MessageBox.Show("Please load something ...");
            }
            else
            {
                var currentDef = this.AnimationList.SelectedItem as Animation;

                this.def.Animations.Add(currentDef.Clone() as Animation);


            }
        }

    }
}
