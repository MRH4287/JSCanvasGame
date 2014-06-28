using MapEditor.Elements;
using MapEditor.GUIElements;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
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
    /// Interaktionslogik für ElementImporter.xaml
    /// </summary>
    public partial class ElementImporter : Window
    {
        public ElementImporter()
        {
            InitializeComponent();
        }

        private void SourceDirLoad_Click(object sender, RoutedEventArgs e)
        {
            Gat.Controls.OpenDialogView dialog = new Gat.Controls.OpenDialogView();
            Gat.Controls.OpenDialogViewModel vm = (Gat.Controls.OpenDialogViewModel)dialog.DataContext;

            vm.IsDirectoryChooser = true;
            vm.IsSaveDialog = false;

            bool? result = vm.Show();
            if ((result.HasValue) && (result.Value == true))
            {
                this.SourceDir.Text = vm.SelectedFilePath;
            }
        }

        private void OutputDirLoad_Click(object sender, RoutedEventArgs e)
        {
            Gat.Controls.OpenDialogView dialog = new Gat.Controls.OpenDialogView();
            Gat.Controls.OpenDialogViewModel vm = (Gat.Controls.OpenDialogViewModel)dialog.DataContext;

            vm.IsDirectoryChooser = true;
            vm.IsSaveDialog = false;

            bool? result = vm.Show();
            if ((result.HasValue) && (result.Value == true))
            {
                this.OutputDir.Text = vm.SelectedFilePath;
            }
        }

        private void StartButton_Click(object sender, RoutedEventArgs e)
        {
            if (!Directory.Exists(this.SourceDir.Text))
            {
                MessageBox.Show("Can't find Source Dir!");
                return;
            }

            var info = new DirectoryInfo(this.SourceDir.Text);
            
            if (!Directory.Exists(this.OutputDir.Text))
            {
                Directory.CreateDirectory(this.OutputDir.Text);
            }

            var files = info.GetFiles();

            CultureInfo cultureInfo   = Thread.CurrentThread.CurrentCulture;
            TextInfo textInfo = cultureInfo.TextInfo;

            ObservableCollection<ElementImporterDataModel> data = new ObservableCollection<ElementImporterDataModel>();

            foreach (var file in files)
            {
                if (file.Extension.ToLower() == ".png")
                {
                    var id = new string(file.Name.Take(file.Name.Length - file.Extension.Length).ToArray());

                    var def = new ElementImporterDataModel()
                    {
                        ID = id,
                        Name = textInfo.ToTitleCase(id),
                        Level = ElementLevel.Bottom,
                        Passable = true,
                        ImageURI = "graphics/terrain/" + file.Name
                    };

                    data.Add(def);
                }
            }

            var json = JsonPrettyPrinterPlus.JsonSerialization.JsonExtensions.ToJSON(data, true);

            this.JSONOutput.Text = json;


        }
    }
}
